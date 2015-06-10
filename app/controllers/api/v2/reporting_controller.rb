class Api::V2::ReportingController < Api::V2::ApplicationController
  skip_before_filter :authenticate_with_token, if: -> { request.format.to_sym === :xlsx }
  include ActionController::MimeResponds

  #TODO only admin should be here! + scope by company multicompany
  def suite_orders
    @events = Event.reportable.includes(dates:[inventories:[:facility], inventories:[:event_date, :facility]]).references(:dates).order('lower(event_dates.event_period) DESC').where(company_id: current_user.company.id)

    # render json: @events.to_json
    render json: @events, each_serializer: EventReportingSerializer
  end

  def confirmations_for_date
    @event_date = EventDate.includes(:confirmed_inventory_options).joins(:inventories).find(params[:id])

    respond_to do |format|
      format.json { render json: @event_date, serializer: EventDateReportingSerializer }
      format.xlsx
    end

  end

  def unconfirmed_for_date
    # @unconfirmed = Inventory.includes(:client)
    #   .joins('LEFT JOIN confirmed_options ON inventory.id = confirmed_options.inventory_id AND inventory.client_id != confirmed_options.client_id')
    #   .where(event_date_id: params[:id])

    @unconfirmed = Inventory.includes(client:[manager:[:profile]], facility:[]).unconfirmed.where(event_date_id: params[:id])
    # @unconfirmed = Company.joins('LEFT JOIN inventory on inventory.client_id = companies.id').where('inventory.event_date_id = ?', params[:id]).merge(Inventory.unconfirmed)
    render json: @unconfirmed, each_serializer: UnconfirmedInventorySerializer
  end

  def client_orders
    @event_date = EventDate.includes(confirmed_inventory_options:[:company]).joins(:inventories).find(params[:id])
    respond_to do |format|
      format.xlsx
    end
  end

  def catering
    @event_date = EventDate.includes(confirmed_inventory_options:[:company]).joins(:inventories).find(params[:id])
    respond_to do |format|
      format.xlsx
      # format.xlsx {
        # response.headers['Content-Disposition'] = 'attachment; filename="my_new_filename.xlsx"'
    # }
    end
  end
end