require 'active_record'

class Category < ActiveRecord::Base
  def contacts
    Contact.where({category_id: self.id})
  end
end
