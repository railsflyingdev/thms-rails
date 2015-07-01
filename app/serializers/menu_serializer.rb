class MenuSerializer < ActiveModel::Serializer
  embed :ids, include: true

  attributes :id, :name, :price, :data

  has_many :sections
end
