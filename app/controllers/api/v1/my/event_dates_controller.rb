class Api::V1::My::EventDatesController < Api::V1::ApplicationController

  def release
    release_data = EventDate.data_for_release(params[:id])
    render json: release_data.to_json
  end


end
