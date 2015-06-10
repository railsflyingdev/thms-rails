class Api::V1::EmployeesController < Api::V1::ApplicationController

  def index
    render json: current_user.company.employees.includes(:profile)
  end

end
