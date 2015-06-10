class MailgunMailer < ActionMailer::Base
  default from: "cs@turnkeyhospitality.com.au"
  include Roadie::Rails::Automatic

  # Subject can be set in your I18n file at config/locales/en.yml
  # with the following lookup:
  #
  #   en.mailgun_mailer.welcome_user_notification.subject
  #
  def welcome_user_notification
    @greeting = "Hi"

    mail to: "scott@vendormax.com.au"
  end

  def reset_password_notifcation(token, employee, domain)
    mail to: "#{employee.email}"
  end

  def reset_password_request(token, employee, request)
    @token, @employee, @request = token, employee, request

    mail to: "#{employee.email}"

  end

  def company_notifier(dest_email, message)
    @origin_destination = dest_email
    @msg = message

    if Rails.env.production?
      dest_email = 'developinghuman1015@gmail.com'
    else
      dest_email = 'developinghuman1015@gmail.com'
    end

    #TODO bcc the people
    mail to: 'developinghuman1015@gmail.com',
         subject: 'notification'
  end

  layout 'mailers/allphones'
  def option_confirm_notification(option)
    @option = option
    if Rails.env.production?

      if @option.company.id == 'd027778e-8a0f-42a0-a32c-bbf715ad71b1'
        mail to: @option.company.manager.email,
             bcc: %w(scott@vendormax.com.au david.culina@gmail.com rob@turnkeyhospitality.com.au),
             subject: "Your Event Confirmation TESTING CLIENT- #{@option.event.name}"
      else
        mail to: @option.company.manager.email,
             bcc: %w(scott@vendormax.com.au david.culina@gmail.com kmacintosh@allphonesarena.com.au pip@turnkeymanagement.com.au),
             subject: "Your Event Confirmation - #{@option.event.name}"
      end
    else
      mail to: @option.company.manager.email,
           bcc: %w(david.culina@gmail.com),
           subject: "DEVELOPMENT - #{@option.event.name}"
    end

  end
end
