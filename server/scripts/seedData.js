const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Club = require('../models/Club');
const Notice = require('../models/Notice');
const Event = require('../models/Event');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nitm-hub', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Club.deleteMany({});
    await Notice.deleteMany({});
    await Event.deleteMany({});

    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
    const admin = new User({
      email: process.env.ADMIN_EMAIL || 'admin@nitm.ac.in',
      rollNumber: 'ADMIN001',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      course: 'BTech',
      branch: 'Computer Science',
      year: 4,
      dateOfBirth: new Date('1995-01-01'),
      gender: 'Male',
      role: 'admin',
      isVerified: true,
      isActive: true
    });

    await admin.save();
    console.log('Admin user created');

    // Create sample students
    const sampleStudents = [
      {
        email: 'john.doe@student.nitm.ac.in',
        rollNumber: 'B21CS001',
        firstName: 'John',
        lastName: 'Doe',
        course: 'BTech',
        branch: 'Computer Science',
        year: 3,
        dateOfBirth: new Date('2001-05-15'),
        gender: 'Male',
        interestedIn: ['Female'],
        interests: ['Programming', 'Gaming', 'Music'],
        hobbies: ['Cricket', 'Guitar', 'Photography'],
        bio: 'Tech enthusiast and cricket lover. Looking for meaningful connections!'
      },
      {
        email: 'jane.smith@student.nitm.ac.in',
        rollNumber: 'B21CS002',
        firstName: 'Jane',
        lastName: 'Smith',
        course: 'BTech',
        branch: 'Computer Science',
        year: 3,
        dateOfBirth: new Date('2001-08-22'),
        gender: 'Female',
        interestedIn: ['Male'],
        interests: ['Reading', 'Art', 'Technology'],
        hobbies: ['Painting', 'Dancing', 'Coding'],
        bio: 'Artist by heart, engineer by mind. Love creating beautiful things!'
      },
      {
        email: 'mike.johnson@student.nitm.ac.in',
        rollNumber: 'B21EE003',
        firstName: 'Mike',
        lastName: 'Johnson',
        course: 'BTech',
        branch: 'Electrical Engineering',
        year: 2,
        dateOfBirth: new Date('2002-03-10'),
        gender: 'Male',
        interestedIn: ['Female'],
        interests: ['Electronics', 'Football', 'Movies'],
        hobbies: ['Football', 'Gaming', 'Cooking'],
        bio: 'Electrical engineering student who loves sports and good movies.'
      },
      {
        email: 'sarah.wilson@student.nitm.ac.in',
        rollNumber: 'B21ME004',
        firstName: 'Sarah',
        lastName: 'Wilson',
        course: 'BTech',
        branch: 'Mechanical Engineering',
        year: 4,
        dateOfBirth: new Date('2000-12-05'),
        gender: 'Female',
        interestedIn: ['Male'],
        interests: ['Robotics', 'Travel', 'Photography'],
        hobbies: ['Travel', 'Photography', 'Badminton'],
        bio: 'Mechanical engineer with a passion for robotics and travel.'
      },
      {
        email: 'alex.brown@student.nitm.ac.in',
        rollNumber: 'M22CS001',
        firstName: 'Alex',
        lastName: 'Brown',
        course: 'MTech',
        branch: 'Computer Science',
        year: 1,
        dateOfBirth: new Date('1998-07-18'),
        gender: 'Male',
        interestedIn: ['Female'],
        interests: ['AI/ML', 'Research', 'Chess'],
        hobbies: ['Chess', 'Reading', 'Hiking'],
        bio: 'MTech student specializing in AI/ML. Chess enthusiast and nature lover.'
      }
    ];

    const students = [];
    for (const studentData of sampleStudents) {
      const hashedPassword = await bcrypt.hash('student123', 10);
      const student = new User({
        ...studentData,
        password: hashedPassword,
        isVerified: true,
        isActive: true
      });
      const savedStudent = await student.save();
      students.push(savedStudent);
    }

    console.log('Sample students created');

    // Create sample clubs
    const sampleClubs = [
      {
        name: 'Computer Science Society',
        description: 'A community for computer science enthusiasts to learn, share, and grow together.',
        category: 'Technical',
        president: students[0]._id,
        secretary: students[1]._id,
        contactEmail: 'css@nitm.ac.in',
        establishedYear: 2015,
        members: [
          { user: students[0]._id, role: 'Core Member' },
          { user: students[1]._id, role: 'Core Member' },
          { user: students[4]._id, role: 'Member' }
        ]
      },
      {
        name: 'Cultural Club',
        description: 'Promoting arts, culture, and creativity among NITM students.',
        category: 'Cultural',
        president: students[1]._id,
        contactEmail: 'cultural@nitm.ac.in',
        establishedYear: 2012,
        members: [
          { user: students[1]._id, role: 'Core Member' },
          { user: students[3]._id, role: 'Member' }
        ]
      },
      {
        name: 'Sports Club',
        description: 'Encouraging sports activities and maintaining fitness among students.',
        category: 'Sports',
        president: students[2]._id,
        contactEmail: 'sports@nitm.ac.in',
        establishedYear: 2010,
        members: [
          { user: students[2]._id, role: 'Core Member' },
          { user: students[3]._id, role: 'Member' }
        ]
      },
      {
        name: 'Robotics Club',
        description: 'Building robots and exploring automation technologies.',
        category: 'Technical',
        president: students[3]._id,
        contactEmail: 'robotics@nitm.ac.in',
        establishedYear: 2018,
        members: [
          { user: students[3]._id, role: 'Core Member' },
          { user: students[4]._id, role: 'Member' }
        ]
      }
    ];

    const clubs = [];
    for (const clubData of sampleClubs) {
      const club = new Club(clubData);
      const savedClub = await club.save();
      clubs.push(savedClub);

      // Add club to members' clubs array
      await User.updateMany(
        { _id: { $in: clubData.members.map(m => m.user) } },
        { $push: { clubs: savedClub._id } }
      );
    }

    console.log('Sample clubs created');

    // Create sample notices
    const sampleNotices = [
      {
        title: 'Mid-Semester Examination Schedule',
        description: 'The mid-semester examinations will be conducted from 15th March to 25th March 2024. Students are advised to check the detailed schedule on the academic portal.',
        category: 'Exam',
        priority: 'High',
        postedBy: admin._id,
        targetAudience: {
          courses: ['BTech'],
          years: [2, 3, 4],
          branches: []
        },
        expiresAt: new Date('2024-03-30')
      },
      {
        title: 'Tech Fest 2024 Registration Open',
        description: 'NITM Tech Fest 2024 registration is now open. Participate in various technical competitions and workshops. Last date for registration: 10th April 2024.',
        category: 'Event',
        priority: 'Medium',
        postedBy: admin._id,
        targetAudience: {
          courses: [],
          years: [],
          branches: []
        }
      },
      {
        title: 'Hostel Fee Payment Deadline',
        description: 'All students are required to pay hostel fees by 20th March 2024. Late payment will incur additional charges.',
        category: 'Hostel',
        priority: 'Urgent',
        postedBy: admin._id,
        targetAudience: {
          courses: [],
          years: [],
          branches: []
        },
        expiresAt: new Date('2024-03-25')
      },
      {
        title: 'Placement Drive - TCS',
        description: 'TCS will be conducting a placement drive on 5th April 2024. Eligible students (CSE, ECE, IT) can apply through the placement portal.',
        category: 'Placement',
        priority: 'High',
        postedBy: admin._id,
        targetAudience: {
          courses: ['BTech'],
          years: [4],
          branches: ['Computer Science', 'Electronics', 'Information Technology']
        }
      }
    ];

    for (const noticeData of sampleNotices) {
      const notice = new Notice(noticeData);
      await notice.save();
    }

    console.log('Sample notices created');

    // Create sample events
    const sampleEvents = [
      {
        title: 'Introduction to Machine Learning',
        description: 'A comprehensive workshop on machine learning fundamentals, covering basic algorithms and practical implementations.',
        eventType: 'Workshop',
        startDate: new Date('2024-04-15T10:00:00'),
        endDate: new Date('2024-04-15T16:00:00'),
        startTime: '10:00 AM',
        endTime: '4:00 PM',
        venue: 'Computer Lab 1',
        organizer: 'Club',
        organizingClub: clubs[0]._id,
        registrationRequired: true,
        registrationDeadline: new Date('2024-04-10'),
        maxParticipants: 50,
        registrationFee: 0,
        status: 'Published',
        createdBy: students[0]._id,
        contactPerson: students[0]._id,
        contactEmail: 'john.doe@student.nitm.ac.in',
        prerequisites: 'Basic programming knowledge in Python'
      },
      {
        title: 'Annual Cultural Night',
        description: 'Join us for an evening filled with music, dance, drama, and cultural performances by our talented students.',
        eventType: 'Cultural',
        startDate: new Date('2024-04-20T18:00:00'),
        endDate: new Date('2024-04-20T22:00:00'),
        startTime: '6:00 PM',
        endTime: '10:00 PM',
        venue: 'Main Auditorium',
        organizer: 'Club',
        organizingClub: clubs[1]._id,
        registrationRequired: false,
        status: 'Published',
        createdBy: students[1]._id,
        contactPerson: students[1]._id,
        contactEmail: 'jane.smith@student.nitm.ac.in'
      },
      {
        title: 'Inter-Branch Football Tournament',
        description: 'Annual football tournament between different branches. Form your teams and compete for the championship!',
        eventType: 'Sports',
        startDate: new Date('2024-04-25T08:00:00'),
        endDate: new Date('2024-04-27T18:00:00'),
        startTime: '8:00 AM',
        endTime: '6:00 PM',
        venue: 'Football Ground',
        organizer: 'Club',
        organizingClub: clubs[2]._id,
        registrationRequired: true,
        registrationDeadline: new Date('2024-04-20'),
        maxParticipants: 200,
        registrationFee: 100,
        status: 'Published',
        createdBy: students[2]._id,
        contactPerson: students[2]._id,
        contactEmail: 'mike.johnson@student.nitm.ac.in'
      }
    ];

    for (const eventData of sampleEvents) {
      const event = new Event(eventData);
      const savedEvent = await event.save();
      
      // Add event to club's events array
      if (eventData.organizingClub) {
        await Club.findByIdAndUpdate(
          eventData.organizingClub,
          { $push: { events: savedEvent._id } }
        );
      }
    }

    console.log('Sample events created');

    // Create some sample likes and matches
    // Student 1 likes Student 2 (mutual - match)
    await User.findByIdAndUpdate(students[0]._id, {
      $push: { 
        likes: { user: students[1]._id, timestamp: new Date() },
        matches: { user: students[1]._id, timestamp: new Date() }
      }
    });

    await User.findByIdAndUpdate(students[1]._id, {
      $push: { 
        likes: { user: students[0]._id, timestamp: new Date() },
        matches: { user: students[0]._id, timestamp: new Date() }
      }
    });

    // Student 3 likes Student 4 (mutual - match)
    await User.findByIdAndUpdate(students[2]._id, {
      $push: { 
        likes: { user: students[3]._id, timestamp: new Date() },
        matches: { user: students[3]._id, timestamp: new Date() }
      }
    });

    await User.findByIdAndUpdate(students[3]._id, {
      $push: { 
        likes: { user: students[2]._id, timestamp: new Date() },
        matches: { user: students[2]._id, timestamp: new Date() }
      }
    });

    // Student 5 likes Student 1 (one-sided)
    await User.findByIdAndUpdate(students[4]._id, {
      $push: { likes: { user: students[0]._id, timestamp: new Date() } }
    });

    console.log('Sample likes and matches created');

    console.log('\n=== SEED DATA SUMMARY ===');
    console.log(`✅ Admin user: ${admin.email} (password: ${process.env.ADMIN_PASSWORD || 'admin123'})`);
    console.log(`✅ Students: ${students.length} (password: student123)`);
    console.log(`✅ Clubs: ${clubs.length}`);
    console.log(`✅ Notices: ${sampleNotices.length}`);
    console.log(`✅ Events: ${sampleEvents.length}`);
    console.log('✅ Sample matches and likes created');
    console.log('\nDatabase seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeder
seedData();