class Api::V2::LeasesController < Api::V2::ApplicationController
  def index
    if params[:company_id]
      @leases = FacilityLease.where(company_id: params[:company_id]).includes(:facility)
      render json: @leases
    elsif params[:facility_id]
      @leases = FacilityLease.where(facility_id: params[:facility_id]).includes(:company)
      render json: @leases
    else
      head :not_found
    end
  end

  def show

  end

  def update
    @lease = FacilityLease.find(params[:id])
    if @lease.update_attributes lease_params
      render json: @lease
    else
      render json: @lease.errors, status: :unprocessable_entity
    end
  end

  def destroy
  end

  def create
    @lease = FacilityLease.new(lease_params)
    if @lease.save
      render json: @lease, status: :created
    else
      render json: @lease.errors, status: :unprocessable_entity
    end
  end

  private

  def lease_params
    params.permit(:facility_id, :company_id, :start, :finish, :is_enabled)
  end

end
