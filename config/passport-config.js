// Import necessary modules
const LocalStrategy = require('passport-local').Strategy; // The authentication strategy using a username and password
const bcrypt = require('bcryptjs'); // Library to help in hashing passwords
const User = require('../models/User'); // Importing the User model/schema for database interactions

// Export a function to configure passport
module.exports = function(passport) {
    
    // Use the LocalStrategy for authentication
    passport.use(
        new LocalStrategy(
            // By default, LocalStrategy looks for "username". We're telling it to use "email" instead
            { usernameField: 'email' }, 
            
            // Async function for authentication
            async (email, password, done) => {
                try {
                    // Attempt to find a user in the database with the provided email
                    const user = await User.findOne({ username: email });
                    
                    // If no user is found, return an authentication failure
                    if (!user) {
                        return done(null, false, { message: 'That email is not registered' });
                    }

                    // Use bcrypt to compare the provided password with the hashed password in the database
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) throw err;

                        // If the passwords match, authenticate the user
                        if (isMatch) {
                            return done(null, user);
                        } else {
                            // If passwords don't match, return an authentication failure
                            return done(null, false, { message: 'Password incorrect' });
                        }
                    });
                } catch (error) {
                    // If any error occurs during the process, return it
                    return done(error);
                }
            })
    );

    // Serialize user into the session. This involves deciding what data from the user object should be stored in the session
    // Here, we're storing just the user's ID in the session for efficiency
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserialize user from the session. This is used to retrieve the full user object from the data saved in the session
    passport.deserializeUser(async (id, done) => {
        try {
            // Find the user based on their ID
            const user = await User.findById(id);
            done(null, user); // If found, the user object is provided as the result
        } catch (error) {
            // If there's an error, pass it
            done(error);
        }
    });
};
