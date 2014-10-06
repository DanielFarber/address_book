require 'active_record'

class Contact < ActiveRecord::Base
  def category
    Category.find_by({id: self.category_id})
  end
end
