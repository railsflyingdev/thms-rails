class InventoryReleaseSerializer < ActiveModel::Serializer

  attributes :id,
             :inventory_id,
             :client_id,
             :company_id,
             :event_class,
             :department_name,
             :event_status,
             :event_type,
             :event_name,
             :event_location,
             :event_date,
             :event_start,
             :event_end,
             :event_category,
             :event_description,
             :event_state

  def department_name
    object.department.name
  end

  def event_status
    object.inventory.event_date.event.status
  end

  def event_type
    object.inventory.event_date.event.event_type
  end

  def event_name
    object.inventory.event_date.event.name
  end

  def event_location
    object.inventory.event_date.event.company.friendly_name
  end

  def event_date
    object.inventory.event_date.event_period.begin.strftime('%m/%d/%Y')
  end

  def event_start
    object.inventory.event_date.event_period.begin.strftime("%H:%M:%S")
  end

  def event_end
    object.inventory.event_date.event_period.end.strftime("%H:%M:%S")
  end

  def event_category
    object.inventory.event_date.event.category
  end

  def event_description
    object.inventory.event_date.event.description[0..49]
  end

  def event_state
    object.inventory.company.address["state"]
  end
end