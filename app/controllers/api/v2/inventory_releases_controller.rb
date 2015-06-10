class Api::V2::InventoryReleasesController < Api::V2::ApplicationController

  PER_PAGE = 30

  def index
    @inv_releases = InventoryRelease.where("client_id = ? AND department_id = ?", current_user.company.id, current_user.department.id).paginate(:page => params[:page], :per_page => PER_PAGE)

    render json: @inv_releases
  end

  def search
    @inv_releases = InventoryRelease.where("client_id = ? AND department_id = ?", current_user.company.id, current_user.department.id).paginate(:page => params[:page], :per_page => PER_PAGE)

    render json: @inv_releases
  end

  def event_types
    @event_types = Event.event_types.compact

    render json: @event_types
  end

end