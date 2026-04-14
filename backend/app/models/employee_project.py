from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class EmployeeProjectMap(Base):
    __tablename__ = "employee_project_map"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("employees.employee_id", ondelete="CASCADE"), nullable=False, index=True)
    project_id = Column(String, ForeignKey("projects.project_id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String, nullable=False, index=True) # e.g., "Project Manager", "Team Lead", "Engineer"
    allocation_percentage = Column(Numeric(5, 2), default=100.00)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    employee = relationship("Employee", foreign_keys=[employee_id], primaryjoin="EmployeeProjectMap.employee_id == Employee.employee_id")
    project = relationship("Project", backref="allocations", foreign_keys=[project_id], primaryjoin="EmployeeProjectMap.project_id == Project.project_id")
