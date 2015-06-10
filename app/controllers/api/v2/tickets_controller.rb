class Api::V2::TicketsController < Api::V2::ApplicationController
  skip_before_filter :authenticate_with_token, except: [:manual, :manual_create]
  # before_filter :ensure_administrator_only, only: [:manual, :manual_create]

  # Manual creation for superadmin only
  def manual
    # @inventories = Inventory.joins(:client).includes(facility:[:company], event_date: [:event], confirmed_inventory_option:[]).where("companies.config ->> 'ticket_type' = 'ezyticket'").all
    @inventories = Inventory.joins(:client).includes(facility:[:company], tickets:[]).where("companies.config ->> 'ticket_type' = 'ezyticket' AND lower(event_dates.event_period) > now()").joins(event_date:[:event])
    render json: @inventories, each_serializer: TicketCreationSerializer
  end

  def manual_request
    # queues workers for tickets to be created, one by one? or en mass? maybe en-mass

    head :created
  end

  # TODO Manual creation for superadmin only
  # Manual creation, pass in same vars and have it build the tickets for you not gonna remove this.
  def manual_create
    @inventory = Inventory.includes(facility:[], event_date: [:event], client:[]).find(params[:inventory_id])
    total_count = 0
    ActiveRecord::Base.transaction do

      @inventory.facility.capacity.times do |seat|

        Ticket.create([
            facility_id: @inventory.facility.id,
            event_date_id: @inventory.event_date.id,
            inventory_id: @inventory.id,
            client_id: @inventory.client.id,
            seat: seat + 1,
            row: @inventory.facility.name.gsub(/[^0-9]/,'').to_i
        ])
        total_count = total_count + 1
      end
    end

    render json: {total_created: total_count}
  end

  # This gets hit by MailGun when it receives an email
  # TODO saturday, update status, maybe make another email to myself for errors annd stuff
  def create
    white_listed_senders = %w(ezytickets@softix.com confirmation@ticketek.com.au)

    if white_listed_senders.include?(params[:sender]) && params['attachment-count'].to_i > 0
      reference_id = params[:recipient].match /\d+/

      unless reference_id.nil?
        ticket = Ticket.includes(event:[]).find_by_reference_number reference_id.to_s

        unless ticket.nil?
          event_name = ticket.event.name.downcase.gsub ' ', '_'
          event_date = ticket.event_date.event_period.begin.strftime('%d_%b_%Y_%H_%M').downcase
          facility_name = ticket.facility.name.downcase.gsub ' ', '_'
          ticket_directory = Rails.root.join("public/tickets/#{event_name}/#{event_date}/#{facility_name}")

          # Make the folder for the tickets
          FileUtils.mkpath ticket_directory

          # TODO Ticketek only has one attachment, change this later
          file = params['attachment-1']
          FileUtils.move file.tempfile.path, "#{ticket_directory}/#{file.original_filename}"

          ticket.storage_type = 'local'
          ticket.file_name = "#{event_name}/#{event_date}/#{facility_name}/#{file.original_filename}"
          ticket.status = 'available'
          ticket.save
        end

      end
    end

    head :ok
    # Resque.enqueue(TicketAdderWorker)
  end

  private
  def ensure_administrator_only
    head :forbidden unless current_user.is_admin?
  end
end
