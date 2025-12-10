from datetime import datetime, timedelta, date, time
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.service import Service
from app.models.schedule import Schedule
from app.models.appointment import Appointment, AppointmentStatus
from app.models.resource import Resource, ResourceType
from app.models.user import User

def get_availability(
    db: Session,
    tenant_id: int,
    service_id: int,
    query_date: date,
    staff_id: Optional[int] = None
) -> List[str]:
    """
    Calculates available time slots for a specific service on a specific date.
    Handles both simple services and multi-step (split) services.
    """
    
    # 1. Get Service Details
    service = db.query(Service).filter(Service.id == service_id, Service.tenant_id == tenant_id).first()
    if not service:
        return []
    
    # Determine if multi-step
    steps = service.steps
    is_multi_step = len(steps) > 0
    
    # 2. Determine Day of Week (0=Monday, 6=Sunday)
    day_of_week = query_date.weekday()
    
    # 3. Get Working Hours (Schedules)
    # Get all active staff schedules for this day
    query = db.query(Schedule).filter(
        Schedule.tenant_id == tenant_id,
        Schedule.day_of_week == day_of_week,
        Schedule.staff_id.isnot(None),
        Schedule.is_active == True
    )
    
    if staff_id:
        query = query.filter(Schedule.staff_id == staff_id)
        
    staff_schedules = query.all()
    
    if not staff_schedules:
        return [] # No staff working today

    # Group schedules by staff_id for easier lookup
    staff_schedule_map = {}
    for s in staff_schedules:
        if s.staff_id not in staff_schedule_map:
            staff_schedule_map[s.staff_id] = []
        staff_schedule_map[s.staff_id].append(s)

    # Get all active resource schedules for this day
    # We fetch ALL resource schedules to avoid complex queries inside loop
    all_resource_schedules = db.query(Schedule).filter(
        Schedule.tenant_id == tenant_id,
        Schedule.day_of_week == day_of_week,
        Schedule.resource_id.isnot(None),
        Schedule.is_active == True
    ).all()
    
    resource_schedule_map = {}
    for s in all_resource_schedules:
        if s.resource_id not in resource_schedule_map:
            resource_schedule_map[s.resource_id] = []
        resource_schedule_map[s.resource_id].append(s)

    # 4. Get Existing Appointments
    start_of_day = datetime.combine(query_date, time.min)
    end_of_day = datetime.combine(query_date, time.max)
    
    from sqlalchemy.orm import joinedload
    existing_appointments = db.query(Appointment).options(
        joinedload(Appointment.service).joinedload(Service.steps)
    ).filter(
        Appointment.tenant_id == tenant_id,
        Appointment.status != AppointmentStatus.CANCELLED,
        Appointment.start_time >= start_of_day,
        Appointment.start_time <= end_of_day
    ).all()

    # 5. Generate Slots
    min_start = min([s.start_time for s in staff_schedules])
    max_end = max([s.end_time for s in staff_schedules])
    
    current_time = datetime.combine(query_date, min_start)
    end_datetime = datetime.combine(query_date, max_end)
    
    available_slots = []
    
    # Helper to check if a specific interval is free for a specific entity (staff or resource)
    def is_interval_free(entity_id, is_staff, start_dt, end_dt):
        # 1. Check Schedule (Must be working)
        schedules = staff_schedule_map.get(entity_id, []) if is_staff else resource_schedule_map.get(entity_id, [])
        is_working = False
        for sched in schedules:
            sched_start = datetime.combine(query_date, sched.start_time)
            sched_end = datetime.combine(query_date, sched.end_time)
            if sched_start <= start_dt and sched_end >= end_dt:
                is_working = True
                break
        if not is_working:
            return False
            
        # 2. Check Appointments (Must not be booked)
        for appt in existing_appointments:
            # Check if this appointment involves the entity
            relevant = False
            if is_staff and appt.staff_id == entity_id:
                relevant = True
            elif not is_staff and appt.resource_id == entity_id:
                relevant = True
            
            if relevant:
                # Check Overlap with the Appointment as a whole first
                appt_start_naive = appt.start_time.replace(tzinfo=None)
                appt_end_naive = appt.end_time.replace(tzinfo=None)
                
                if appt_start_naive < end_dt and appt_end_naive > start_dt:
                    # Overlap detected. Now check if it's a "Real" conflict based on steps.
                    
                    # If service has no steps, it's a full block conflict
                    if not appt.service.steps:
                        return False
                    
                    # Iterate steps to see if the specific overlap is active
                    appt_step_time = appt_start_naive
                    is_conflict = False
                    
                    for step in appt.service.steps:
                        step_end = appt_step_time + timedelta(minutes=step.duration)
                        
                        # Check if THIS step overlaps with the requested interval
                        if appt_step_time < end_dt and step_end > start_dt:
                            # We have an overlap with this step.
                            # Is the entity "Active" in this step?
                            
                            if is_staff:
                                if step.is_staff_active:
                                    is_conflict = True
                                    break
                            else:
                                # For Resources, we assume they are always needed if the step requires that type
                                # But here we are checking a specific resource ID.
                                # If the appointment uses this resource, and the step requires a resource...
                                # Simplified: If resource is assigned to appt, it's likely occupied for the whole duration 
                                # UNLESS we implement resource-releasing steps.
                                # For now, let's assume Resources are occupied for the whole duration if assigned.
                                # TODO: Implement granular resource release.
                                is_conflict = True
                                break
                        
                        appt_step_time = step_end
                    
                    if is_conflict:
                        return False

        return True

    while current_time < end_datetime:
        slot_valid = False
        
        # We need to find ONE staff member who can fulfill the ENTIRE service flow
        # (considering only steps where is_staff_active=True)
        
        potential_staff_ids = staff_schedule_map.keys()
        
        for staff_id in potential_staff_ids:
            staff_can_do_it = True
            
            # Simulate the service flow
            step_current_time = current_time
            
            # If simple service, treat as one step
            service_steps_to_check = steps if is_multi_step else [
                type('obj', (object,), {
                    'duration': service.duration_minutes, 
                    'is_staff_active': True, 
                    'requires_resource_type': service.requires_resource_type
                })
            ]
            
            for step in service_steps_to_check:
                step_end_time = step_current_time + timedelta(minutes=step.duration)
                
                # Check Staff Availability (if active)
                if step.is_staff_active:
                    if not is_interval_free(staff_id, True, step_current_time, step_end_time):
                        staff_can_do_it = False
                        break
                
                # Check Resource Availability (if required)
                # For resources, we just need ANY resource of the type to be free
                if step.requires_resource_type:
                    resources_of_type = db.query(Resource.id).filter(
                        Resource.tenant_id == tenant_id,
                        Resource.type == step.requires_resource_type
                    ).all()
                    
                    resource_found = False
                    for res in resources_of_type:
                        if is_interval_free(res.id, False, step_current_time, step_end_time):
                            resource_found = True
                            break
                    
                    if not resource_found:
                        staff_can_do_it = False
                        break

                # Advance time
                step_current_time = step_end_time
            
            if staff_can_do_it:
                slot_valid = True
                break # Found a staff member, no need to check others
        
        if slot_valid:
            available_slots.append(current_time.strftime("%H:%M"))
            
        # Optimization: Step by service duration to avoid gaps (Grid Scheduling)
        # Or defaults to 30 mins if duration is very small?
        # User requested 60m service -> 60m slots.
        step_minutes = service.duration_minutes if service.duration_minutes > 0 else 30
        current_time += timedelta(minutes=step_minutes)

    return available_slots
