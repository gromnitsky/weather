require 'nokogiri'
require 'json'

def coords s
  r = s.split.map {|v| "%.4f" % v}
  { lat: r[0], lon: r[1] }
end

doc = Nokogiri::XML File.read ARGV[0]

puts "export default"
puts (doc.css('gweather > region > country').map do |country|
  country_name = country.css('> _name').text
  country.css('city').map do |city|
    [ "#{city.css('_name').text}; #{country_name}",
      coords(city.css('coordinates').text) ]
  end
end.filter {|v| v.size > 0 }.flatten 1).to_json
