class Employee < ActiveRecord::Base

  default_scope { order('created_at DESC') }
  delegate :can?, :cannot?, :to => :ability

  belongs_to :company
  belongs_to :department
  has_one :profile

  has_many :request_attendances, as: :attendee
  has_many :released_inventory_requests, foreign_key: :requester_id

  store_accessor :permissions, :can_login?
  store_accessor :permissions, :login_disabled?
  store_accessor :permissions, :venue_admin?
  store_accessor :permissions, :super_admin?
  store_accessor :permissions, :client_admin?
  store_accessor :permissions, :developer



  has_secure_password

  validates_presence_of :email
  # validates :email
  class << self
    def verifier_for(purpose)
      @verifiers ||= {}
      @verifiers.fetch(purpose) do |p|
        @verifiers[p] = Rails.application.message_verifier("#{self.name}-#{p.to_s}")
      end
    end

    def for_password_token(token)
      employee_id, timestamp = verifier_for('reset-password').verify(token)
      find(employee_id)
    end

  end

  def reset_password_token
    verifier = self.class.verifier_for('reset-password') # Unique for each type of messages
    verifier.generate([id, Time.now])
  end

  def reset_password!(params)
    # This raises an exception if the message is modified
    employee_id, timestamp = self.class.verifier_for('reset-password').verify(params[:token])

    if timestamp > 1.day.ago
      self.password = params[:password]
      self.password_confirmation = params[:password_confirmation]
      save!
    else
      # Token expired
      # ...
    end
  end

  def ability
    @ability ||= Ability.new(self)
  end
end
