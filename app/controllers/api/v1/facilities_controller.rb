class Api::V1::FacilitiesController < Api::V1::ApplicationController

  def index
    facilities = Facility.where(company_id: params[:company_id])
    render json: facilities
  end

  def show
    @facility = Facility.where(company_id: params[:company_id]).find(params[:id])
    render json: @facility
  end
end
