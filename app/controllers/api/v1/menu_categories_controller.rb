class Api::V1::MenuCategoriesController < Api::V1::ApplicationController

  def index
    categories = MenuItemCategory.includes(:children, :menu_items).master_category
    render json: categories
  end

  def show
    category = MenuItemCategory.includes(:menu_items).find(params[:id])
    render json: category
  end
end
