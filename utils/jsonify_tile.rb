#!/usr/bin/ruby -w

# jsonify_tile.rb
# 
# Accepts a list of image files and for each one it mocks up a JSON closure for
# it, with the image encoded as a data: URI and the name of the tile already
# set to the filename.

require 'rubygems'
require 'base64'
require 'pp'
require 'json'

id = 1

puts '['

puts ARGV.map {|a|
  json_obj = Hash.new
  json_obj[:name] = File.basename(a, '.png')
  imgdata = File.open(a, 'rb') do |f|
    Base64.encode64(f.read).gsub(/\n/, '')
  end
  imgdata_url = 'data:image/png;base64,' + imgdata
  json_obj[:image] = imgdata_url
  json_obj[:id] = id
  id += 1
  
  JSON.dump(json_obj)
}.join(",\n");

puts ']'
