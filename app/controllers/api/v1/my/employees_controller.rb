class Api::V1::My::EmployeesController < Api::V1::ApplicationController
  def index
    employees = current_user.company.employees
    render json: employees
  end

  def show
    employee = current_user.company.employees.find(params[:id])
    render json: employee
  end
end
