class EmployeeSerializer < ActiveModel::Serializer
  attributes :id, :email, :permissions

  has_one :profile
  has_one :company
end
