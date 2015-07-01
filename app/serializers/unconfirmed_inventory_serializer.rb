class UnconfirmedInventorySerializer < ActiveModel::Serializer
  attributes :id, :client_name, :client_email, :client_phone, :client_contact, :facility_name, :facility_number

  def client_name
    object.client.friendly_name
  end

  def client_email
    object.client.manager.email if object.client.manager
  end

  def client_contact
    [object.client.manager.profile.first_name,object.client.manager.profile.last_name].join ' ' if object.client.manager
  end

  def client_phone
    object.client.phone
  end

  def facility_name
    object.facility.name
  end

  def facility_number
    object.facility.name.scan(/\d/).join('').to_i
  end

end
