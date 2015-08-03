class NotificationWorker

  @queue = :notification

  def self.perform(arguments)
    companies = arguments["companies"]
    message = arguments["message"]
    Company.search_with_uuids(companies).each do |company|
      if company.manager.present? && company.notify_email == true
        MailgunMailer.company_notifier(company.manager.email, message).deliver
        puts "Sending Mail to #{company.manager.email}"
      end
    end
  end

end