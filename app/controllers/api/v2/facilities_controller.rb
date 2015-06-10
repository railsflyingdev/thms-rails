class Api::V2::FacilitiesController < Api::V2::ApplicationController

  def index
    # coming in through /companies/:company_id/facilities
    if params[:company_id]
      @facilities = Facility.includes(current_active_lease: [:company]).where(company_id: params[:company_id])
    else
    # coming in directly, /facilities
      @facilities = Facility.includes(current_active_lease: [:company]).where(company_id: current_user.company.id)
    end

    render json: @facilities
  end

  def show
    @facility = Facility.find(params[:id])

    if @facility
      render json: @facility
    else
      head :not_found
    end
  end

  def update
    @facility = Facility.find(params[:id])
    if @facility.update_attributes facility_params
      render json: @facility, status: :ok
    else
      render json: @facility.errors, status: :unprocessable_entity
    end

  end

  def destroy
  end

  def create
    @facility = Facility.new facility_params
    # TODO More advanced security here
    @facility.company = current_user.company

    if @facility.save
      render json: @facility, status: :created
    else
      render json: @facility.errors, status: :unprocessable_entity
    end
  end

  private
  def facility_params
    params.permit(:name, :capacity, :facility_type, :company_id)
  end
end
