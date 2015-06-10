class Client < ActiveRecord::Base
  self.table_name = :companies

  default_scope {where(company_type: :company)}
  has_many :client_companies

  has_many :companies, through: :client_companies
end
