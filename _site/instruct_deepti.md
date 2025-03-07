________________________________________________________________________________________
Serve the Jekyll Site:
Note: If we run the above command, it overwrites everything in _site folder.
----------------------------------------------------------------------------------------
bundle exec jekyll clean <!-- No need to run this everytime -->
bundle exec jekyll serve
or
jekyll serve

_______________________________________
Access the Site in Your Browser
By default, Jekyll serves your site at:
---------------------------------------

👉 http://127.0.0.1:4000/

_________________________________________________________
Live Reload (Optional)
To enable automatic reloading when you modify files, run:
----------------------------------------------------------

bundle exec jekyll serve --livereload

xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

1. To make changes in the first page's about section, modify `/_pages/about.md`

2. To make changes in the first page's news section, modify `_news` folder

3. `blog/_config.yml` has changes related to displayed name on front page and on tab, user ids for different social media platform.

4. `grep -rl "News" .` -> command to search for the word "News" in all files within a folder and list the matching filenames.
After this, to increase vertical margin before subsection News, I made changes in `_includes/news.html` -> "margin-top: 6%;"


