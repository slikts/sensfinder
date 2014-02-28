import os
import sys
import markdown

from cactus.utils import fileList


template = """
%s

{%% extends "%s" %%}
{%% block %s %%}

%s

{%% endblock %%}
"""

title_template = """
{%% block title %%}%s{%% endblock %%}
"""

CLEANUP = []

def preBuild(site):
	for path in fileList(site.paths['pages']):

		if not path.endswith('.md'):
			continue

		md = markdown.Markdown(extensions=['meta'])

		with open(path, 'r') as f:
			html = md.convert(f.read())

		metadata = []

		for k, v in md.Meta.iteritems():
			if k == 'title':
				pass
			metadata.append('%s: %s' % (k, v[0]))

		outPath = path.replace('.md', '.html')

		with open(outPath, 'w') as f:
		
			data = template % (
				'\n'.join(metadata),
				md.Meta['extends'][0],
				md.Meta['block'][0],
				html
			)
			
			try:
				data += title_template % md.Meta['title'][0]
			except KeyError:
				pass

			f.write(data)

		CLEANUP.append(outPath)

def postBuild(site):
	global CLEANUP
	for path in CLEANUP:
		print path
		os.remove(path)
	CLEANUP = []