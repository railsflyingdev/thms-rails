class CompanySerializer < ActiveModel::Serializer
  attributes :id, :friendly_name, :company_type, :name,
             :phone, :fax, :state, :city, :suburb, :address1,
             :address2, :postcode, :ticket_type, :notify_sms, :notify_email,
             :guest_module

  has_one :manager, serializer: EmployeeForCompanySerializer
end
