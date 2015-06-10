class ClientCompany < ActiveRecord::Base

  self.table_name = :clients_companies

  belongs_to :company
  belongs_to :client
end