class MailgunMailerPreview < ActionMailer::Preview

  def option_confirm_notification
    option = ConfirmedInventoryOption.order('created_at ASC').last
    MailgunMailer.option_confirm_notification(option)
  end

end