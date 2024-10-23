export const preSave = (schema) => {
    schema.pre('save', function(next) {
        if (this.isModified('first_name')) {
            this.first_name = this.first_name.charAt(0).toUpperCase() + this.first_name.slice(1).toLowerCase();
        }
        if (this.isModified('last_name')) {
            this.last_name = this.last_name.charAt(0).toUpperCase() + this.last_name.slice(1).toLowerCase();
        }
        next();
    });
};