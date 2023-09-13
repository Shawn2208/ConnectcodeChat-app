// Import necessary modules
const LocalStrategy = require('passport-local').Strategy; // Local Strategy for authentication using a username and password
const User = require('./models/User'); // Importing the User model/schema for database interactions

// Export the passport configuration function
module.exports = function(passport) {
    
    // Define and use the local strategy for authentication
    passport.use(new LocalStrategy(async (username, password, done) => {
        // Attempt to find a user in the database with the provided username
        const user = await User.findOne({ username: username });

        // If no user is found, return an authentication failure
        if (!user) {
            return done(null, false, { message: 'No user found' });
        }

        // Validate the provided password against the user's stored password (assuming you have a method `validatePassword` in your User model)
        const isValid = await user.validatePassword(password);

        // If the password is incorrect, return an authentication failure
        if (!isValid) {
            return done(null, false, { message: 'Incorrect password' });
        }

        // If the user is found and password is valid, return the user
        return done(null, user);
    }));

    // Serialize user into the session. Here, only the user's ID is stored in the session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserialize user from the session. This retrieves the user's full object based on the user ID
    passport.deserializeUser((id, done) => {
        // Find the user based on their ID
        User.findById(id, (err, user) => {
            done(err, user); // If there's an error, pass the error. Otherwise, pass the retrieved user object.
        });
    });
}

