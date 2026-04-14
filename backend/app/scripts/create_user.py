import sys
from app.core.database import SessionLocal
from app.models.employee import Employee
from app.core.security import hash_password

def create_user(employee_id, email, password, name="Admin User", department="Administration"):
    db = SessionLocal()

    # Standard module list for Admin role
    admin_modules = [
        'Dashboard', 'MOM', 'Employee Master', 'Project Master', 
        'Department Master', 'Upload Trackers', 
        'Budget Upload', 'Settings'
    ]

    from app.models.application_access import ApplicationAccess
    
    employee = Employee(
        employee_id=employee_id,
        name=name,
        email=email,
        department=department,
        role="Admin",
        status="Active",
        modules=admin_modules,
    )

    try:
        db.add(employee)
        db.commit()
        db.refresh(employee)
        
        # Create Auth record
        access = ApplicationAccess(
            employee_id=employee.id,
            email=email,
            hashed_password=hash_password(password)
        )
        db.add(access)
        db.commit()
        
        print(f"Successfully created admin user and auth record: {email} (ID: {employee_id})")
    except Exception as e:
        db.rollback()
        print(f"Error creating user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python -m app.scripts.create_user <employee_id> <email> <password>")
        sys.exit(1)
    
    create_user(sys.argv[1], sys.argv[2], sys.argv[3])
