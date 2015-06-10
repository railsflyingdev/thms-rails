class Api::V2::MenusController < Api::V2::ApplicationController
  def index
    @menus = Menu.includes(:sections, :items).all
    render json: @menus, root: :menus
  end

  def show

  end

  def update

  end

  def destroy
  end

  def create
  end

end
