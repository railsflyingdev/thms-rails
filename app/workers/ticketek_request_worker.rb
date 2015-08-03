require 'signet/oauth_2/client'

class TicketekRequestWorker

  @queue = :tickets
  @redis = Redis.new

  def self.create_oauth_client
    saved_state = @redis.get 'allphones_ticketek_client'

    @oauth_client = Signet::OAuth2::Client.new JSON.parse(saved_state) if saved_state
    # Kernel.sleep(20)
    @oauth_client = authenticate unless saved_state
  end

  # facility, inventory, event
  def self.perform(arguments)

    create_oauth_client if Rails.application.config.x.ticketek_provider.oauth_enabled
    # request = request_ticket_with_oauth_provider
    request = request_ticket(arguments["event_code"], arguments["facility"], arguments["ref"], arguments["client"])


    if request[:status] == 201
      puts "request success"
      Ticket.find_by_reference_number(arguments["ref"]).update_attributes(
          ticketek_id: request[:body].gsub('"', ''),
          status: 'transiting'
      )
    else
      puts 'messed up.'
      throw Exception
    end

  end



  def self.request_ticket(event_code, suite_number, ticket_reference, leasee)
    # EventCode=ESDS2014811&SectionCode=SSUITE3&SeatCode=&Email=dev%40999.mg.eventhub.com.au&FirstName=Harry&LastName=Potter
    body = {
        EventCode: event_code,
        FirstName: leasee,
        LastName: "Suite #{suite_number}",
        SectionCode: "SSUITE#{suite_number}",
        Email: "#{Rails.application.config.x.ticketek_provider.send_tickets_user}@#{ticket_reference}.mg.eventhub.com.au"
    }

    puts "body -> #{body}"
    if Rails.application.config.x.ticketek_provider.oauth_enabled
      request = request_ticket_from_oauth_provider(body)
      {body: request.body, status: request.status}
    else
      request = request_ticket_from_non_oauth_provider(body)
      {body: request.body, status: request.code}
    end

  end

  # Ask for a ticket from the API
  # return the ticketek ID
  def self.request_ticket_from_oauth_provider(body)
    @oauth_client.fetch_protected_resource(
        uri: Rails.application.config.x.ticketek_provider.request_uri,
        method: 'POST',
        body: body
    )
  end

  # Returning the ticket ID
  def self.request_ticket_from_non_oauth_provider(body)
    HTTParty.post(Rails.application.config.x.ticketek_provider.request_uri, {
      headers: {'X-Auth-Token' => Rails.application.config.x.ticketek_provider.authentication_token},
      body: body
    })
  end



  def self.authenticate
    puts "Creating New OAuth Client"

    client = Signet::OAuth2::Client.new(
        token_credential_uri: Rails.application.config.x.ticketek_provider.oauth_token_uri,
        client_id: Rails.application.config.x.ticketek_provider.client_id,
        client_secret: Rails.application.config.x.ticketek_provider.client_secret
    )


    client.grant_type = 'client_credentials'

    begin
      client.fetch_access_token!
      puts "AUTHORIZED FINE: => #{client.to_json}"

      @redis.set('allphones_ticketek_client', client.to_json)
      # @redis.expireat 'allphones_ticketek_client', client.expires_in

      puts "CLIENT: => #{@redis.get('allphones_ticketek_client')}"
      client

    rescue Signet::AuthorizationError => error
      puts error
      throw Signet::AuthorizationError
    end







    # client.fetch_protected_resource(uri: 'https://uat-api-cts.ticketek.com.au/Tickets/')
    # EventCode=ESDS2014811&SectionCode=SSUITE3&SeatCode=&Email=dev%40999.mg.eventhub.com.au&FirstName=Harry&LastName=Potter
  #   test authentication with here -> https://uat-api-cts.ticketek.com.au/Tickets/ should return 200 OK
  end

end