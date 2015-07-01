class EmployeeForCompanySerializer < ActiveModel::Serializer
  attributes :id, :email, :full_name

  def full_name
    [object.profile.first_name, object.profile.last_name].join(' ')
  end
end
