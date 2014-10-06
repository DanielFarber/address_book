#\ -w -p 4567

require 'rack/parser'

use Rack::Parser, :content_types => {
  'application/json'  => Proc.new { |body| ::MultiJson.decode body }
}

require './server'
run Sinatra::Application