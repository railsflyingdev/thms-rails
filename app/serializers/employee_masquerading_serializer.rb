class EmployeeMasqueradingSerializer < ActiveModel::Serializer
  attributes :id, :full_name, :email, :company_name

  def full_name
    [object.profile.first_name, object.profile.last_name].join(' ')
  end

  def company_name
    object.company.friendly_name
  end
end
