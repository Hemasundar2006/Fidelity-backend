# Setup

1. Install dependencies
   \`\`\`bash
   cd server
   npm install
   \`\`\`

2. Set up environment variables
   Rename \`.env.example\` to \`.env\` and fill in your MongoDB and Cloudinary credentials.

3. Seed the database
   \`\`\`bash
   npm run seed
   \`\`\`
   This creates test users (e.g., admin@fid.com / password123, smith@fid.com / password123).

4. Start the server
   \`\`\`bash
   npm run dev
   \`\`\`

# Testing
Run tests using:
\`\`\`bash
npm run test
\`\`\`
