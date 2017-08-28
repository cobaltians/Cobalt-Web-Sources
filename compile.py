import os

libName = "cobalt"
distrib_path = os.path.normpath(os.path.abspath(os.path.join(os.pardir, 'Cobalt-Web'))) #../Cobalt-Web
web_sources_path = os.path.normpath(os.path.abspath(os.path.join(os.path.dirname(__file__)))) #here
common_file_path= os.path.normpath(os.path.abspath(os.path.join(web_sources_path, 'common', "%s.js" % libName )))
loader= os.path.normpath(os.path.abspath(os.path.join(web_sources_path, 'common', "loader.js")))
distrib_file_path = os.path.join( distrib_path, "%s.js" % libName )

if not os.path.isfile(common_file_path):
    print "error : no common file %s " % common_file_path
    exit()

if not os.path.isfile(loader):
    print "error : no common file %s " % loader
    exit()

android_adapter=os.path.abspath(os.path.join(web_sources_path, 'adapters', "Android", "adapter.js"))
if not os.path.isfile(android_adapter):
    print "error : no adapter file for Android"
    exit()

ios_adapter=os.path.abspath(os.path.join(web_sources_path, 'adapters', "iOS", "adapter.js"))
if not os.path.isfile(ios_adapter):
    print "error : no adapter file for iOS"
    exit()

print "\nconcatening files..."
filenames = [common_file_path, android_adapter, ios_adapter, loader]
with open(distrib_file_path, 'w+') as outfile:
    for fname in filenames:
        with open(fname) as infile:
            outfile.write(infile.read())

print "\ncreating minified version"
os.chdir(distrib_path)
os.system('uglifyjs --source-map {libName}.min.js.maps -o {libName}.min.js {libName}.js'.format(libName=libName))
        

print "\n---finished"
    
    
    
    

        
    
