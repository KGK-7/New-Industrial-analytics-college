import sys
import os

# Add the backend directory to sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.core.database import SessionLocal
from app.models.employee import Employee
from app.core.security import hash_password
from app.models.application_access import ApplicationAccess

def create_super_admin():
    db = SessionLocal()
    
    # All modules as per MODULE_LIST in frontend
    all_modules = [
        'Dashboard', 'MOM', 'Employee Master', 'Project Master', 
        'Department Master', 'Upload Trackers', 
        'Budget Upload', 'Settings'
    ]
    
    employee_id = "SA001"
    email = "superadmin@caldim.com"
    password = "Caldim@2026"
    name = "Super Admin"
    department = "IT Administration"

    try:
        # Check if employee profile already exists
        employee = db.query(Employee).filter(Employee.email == email).first()
        if employee:
            print(f"Employee with email {email} already exists. Updating profile...")
            employee.modules = all_modules
            employee.role = "Super Admin"
            db.commit()
        else:
            employee = Employee(
                employee_id=employee_id,
                name=name,
                email=email,
                department=department,
                role="Super Admin",
                status="Active",
                modules=all_modules,
            )
            db.add(employee)
            db.commit()
            db.refresh(employee)

        # Sync/Create Auth in application_access
        access = db.query(ApplicationAccess).filter(ApplicationAccess.email == email).first()
        if access:
            access.hashed_password = hash_password(password)
            access.employee_id = employee.id
            db.commit()
        else:
            access = ApplicationAccess(
                employee_id=employee.id,
                email=email,
                hashed_password=hash_password(password)
            )
            db.add(access)
            db.commit()
            
        print(f"Successfully synchronized super admin: {email}")

    except Exception as e:
        db.rollback()
        print(f"Error creating super admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_super_admin()
