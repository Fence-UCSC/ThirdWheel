# Master Plan by *Baarsaad*

**CMPS 183 Fall 2016**

Chris Canchola, Chandler Moeller, Eddie Schubert, August Valera

## Summary
Sometimes it can be difficult for a group of friends to decide on what
to do. **Master Plan** is an interactive web service whose primary
function is to randomly select an activity to do next based on
user-inputted choices and a cornucopia of other options.

Users will vote on which option they want to win, increasing the chance
of that option being chosen. The selection will be visualized through a
spinning wheel. Users will be able to collaborate on one web page in
order to add suggestions and observe the result.  The website will save
past wheels for a user so they can be reused.

## Brief tour
The homepage will have a button to sign in, and information about the
site if not signed in. If signed in, the homepage will have a list of
past “wheels”, as well as the option to create a new one.

Each “wheel” will have it’s own page, with a box to input suggested
ideas to the group. Users can invite others to open this page directly by link, and they will be prompted to sign in if they would like to participate and submit their own suggestions. Each inputted suggestion can be voted upon, with each user receiving X amount of votes. Clicking a button “spins the wheel”, at which point the an item will be randomly selected based on the weight of votes.

## Perceived Difficulty
One of the greatest difficulty, from our current knowledge of web2py, will be implementing the wheel such that multiple users can interact with it at one time. This will require keeping track of who is authorized to view the page (if set to private), creating new accounts if necessary while matching inputted emails and possibly doing verification, handling OAuth, etc.

## Minimum Deliverable Entity
At minimum this project will be a web application that supports the creation of the wheel, complete with weighted choices that are chosen and weighted by the users. The wheel will then be able to select one of the options. That being said, our vision for this project goes well beyond this as stated in the other parts of this document.

## Optional features
* Visualization of the spinning wheel
* Google OAuth
* Save the project as a draft for repeat usage
* Microtransactions (sponsored activities, purchasing more votes)
* Advertisements
* Custom themes, associating gifs with various activities
* Local usage without signing in
* Dank memes

## Tasks
* Chris
  * UI
  * Testing
* Chandler
  * Product owner
  * Visualization
  * Testing
* Eddie
  * Database
  * OAuth
* August
  * Scrum master
  * UI/UX