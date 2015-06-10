class Ability
  include CanCan::Ability

  def build_manageable_companies(user)
    @manageable_companies = user.company.clients
  end

  def initialize(user)

    user ||= Employee.new
    build_manageable_companies user


    if user.venue_admin?

      can :masquerade, Employee

      can [:read, :update], Company do |resource|
        @manageable_companies.any? { |r| resource.id == r.id }
      end

    end


    can :login unless user.login_disabled?

    if user.super_admin?
      can :masquerade, Employee
      can :manage, :all
    end

    unless user.super_admin?
      cannot :create, Ticket
      cannot :destroy, Ticket
    end


    # Client admin can only manage their own employees
    if user.client_admin?
      can :masquerade, Employee, company_id: user.company_id
      can :manage, :all
    end



    # Define abilities for the passed in user here. For example:
    #
    #   user ||= User.new # guest user (not logged in)
    #   if user.admin?
    #     can :manage, :all
    #   else
    #     can :read, :all
    #   end
    #
    # The first argument to `can` is the action you are giving the user
    # permission to do.
    # If you pass :manage it will apply to every action. Other common actions
    # here are :read, :create, :update and :destroy.
    #
    # The second argument is the resource the user can perform the action on.
    # If you pass :all it will apply to every resource. Otherwise pass a Ruby
    # class of the resource.
    #
    # The third argument is an optional hash of conditions to further filter the
    # objects.
    # For example, here the user can only update published articles.
    #
    #   can :update, Article, :published => true
    #
    # See the wiki for details:
    # https://github.com/CanCanCommunity/cancancan/wiki/Defining-Abilities
  end
end
