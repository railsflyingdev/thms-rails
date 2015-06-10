class Api::V1::FacilityLeasesController < Api::V1::ApplicationController

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
    params.permit(:start, :finish, :company_id, :is_enabled, :facility_id)
  end
end