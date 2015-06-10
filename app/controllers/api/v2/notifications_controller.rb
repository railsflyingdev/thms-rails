class Api::V2::NotificationsController < Api::V2::ApplicationController

  def create
    if current_user.venue_admin?
      companies = params[:companies]
      message = params[:message]
      Resque.enqueue(NotificationWorker, {"companies" => companies, "message" => message})
    end

    render :nothing => true, :status => :ok
  end

end