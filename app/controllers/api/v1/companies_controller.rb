class Api::V1::CompaniesController < Api::V1::ApplicationController
  def index
    @companies = Company.all
    render json: @companies
  end

  def show
    @company = Company.find(params[:id])
    render json: @company
  end

  def create

  end

  def update

  end

  def delete

  end
end
