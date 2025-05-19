// backend/controllers/recommendationController.js
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const UserProgress = require('../models/userProgressModel');
const Course = require('../models/courseModel');

// @desc    Get personalized course recommendations for the logged-in user
// @route   GET /api/recommendations
// @access  Private
const getRecommendations = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId).select('interests goals');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    const userInterests = user.interests || [];
    const userGoals = user.goals || [];

    const completedProgressRecords = await UserProgress.find({ user: userId, completed: true }).select('lesson course');
    const completedLessonIdsSet = new Set();
    const completedCourseIdsSet = new Set();

    for (const record of completedProgressRecords) {
        if (record.lesson) completedLessonIdsSet.add(record.lesson.toString());
        if (record.course) completedCourseIdsSet.add(record.course.toString());
    }

    const allCourses = await Course.find({})
        .populate({
            path: 'modules',
            populate: { path: 'lessons', select: '_id title' },
            select: '_id title lessons'
        })
        .select('_id title description category modules tags createdAt difficulty'); // description is already selected

    const courseCompletionStatus = new Map();
    const startedCourseIds = new Set();

    allCourses.forEach(course => {
        let totalLessonsInCourse = 0;
        let completedLessonsInCourse = 0;
        if (course.modules && course.modules.length > 0) {
            course.modules.forEach(module => {
                if (module.lessons && module.lessons.length > 0) {
                    module.lessons.forEach(lesson => {
                        totalLessonsInCourse++;
                        if (completedLessonIdsSet.has(lesson._id.toString())) {
                            completedLessonsInCourse++;
                            startedCourseIds.add(course._id.toString());
                        }
                    });
                }
            });
        }
        const isFullyCompleted = (totalLessonsInCourse > 0 && completedLessonsInCourse === totalLessonsInCourse) || completedCourseIdsSet.has(course._id.toString());
        courseCompletionStatus.set(course._id.toString(), {
            totalLessons: totalLessonsInCourse,
            completedLessons: completedLessonsInCourse,
            isFullyCompleted: isFullyCompleted,
        });
    });

    let finalRecommendations = [];
    const recommendedCourseIds = new Set();

    // --- 1. "Goal-Driven" Recommendations ---
    if (userGoals.length > 0) {
        const goalDrivenRecommendations = [];
        const potentialGoalCourses = allCourses.filter(course => {
            const status = courseCompletionStatus.get(course._id.toString());
            return status && !status.isFullyCompleted;
        });

        potentialGoalCourses.forEach(course => {
            let matchScore = 0;
            const courseText = `${course.title || ''} ${course.description || ''} ${course.category || ''} ${(course.tags || []).join(' ')}`.toLowerCase();
            userGoals.forEach(goal => {
                const goalKeywords = goal.toLowerCase().split(/\s+/).filter(k => k.length > 2);
                goalKeywords.forEach(keyword => {
                    if (courseText.includes(keyword)) matchScore++;
                });
            });

            if (matchScore > 0) {
                goalDrivenRecommendations.push({
                    type: 'goal_driven',
                    courseId: course._id,
                    courseTitle: course.title,
                    description: course.description, // <-- ADD description
                    category: course.category,
                    tags: course.tags || [],
                    difficulty: course.difficulty,
                    message: `Relevant to your goal: "${course.title}"`,
                    link: `/courses/${course._id}`,
                    score: matchScore
                });
            }
        });
        goalDrivenRecommendations.sort((a, b) => b.score - a.score);
        goalDrivenRecommendations.slice(0, 3).forEach(rec => {
            if (!recommendedCourseIds.has(rec.courseId.toString())) {
                finalRecommendations.push(rec);
                recommendedCourseIds.add(rec.courseId.toString());
            }
        });
    }

    // --- 2. "Next Step" Recommendations ---
    if (finalRecommendations.length < 10) {
        const nextStepRecommendationsRaw = [];
        const startedNonCompletedCourses = allCourses.filter(course =>
            startedCourseIds.has(course._id.toString()) &&
            !courseCompletionStatus.get(course._id.toString())?.isFullyCompleted &&
            !recommendedCourseIds.has(course._id.toString())
        );

        for (const course of startedNonCompletedCourses) {
            let foundNextStep = false;
            if (course.modules && course.modules.length > 0) {
                for (const module of course.modules) {
                    if (module.lessons && module.lessons.length > 0) {
                        for (const lesson of module.lessons) {
                            if (!completedLessonIdsSet.has(lesson._id.toString())) {
                                nextStepRecommendationsRaw.push({
                                    type: 'next_step',
                                    courseId: course._id,
                                    courseTitle: course.title,
                                    description: course.description, // <-- ADD description
                                    moduleId: module._id,
                                    moduleTitle: module.title,
                                    lessonId: lesson._id,
                                    lessonTitle: lesson.title,
                                    category: course.category,
                                    tags: course.tags || [],
                                    difficulty: course.difficulty,
                                    message: `Continue with "${lesson.title}" in "${module.title}"`,
                                    link: `/lessons/${lesson._id}`
                                });
                                foundNextStep = true;
                                break;
                            }
                        }
                    }
                    if (foundNextStep) break;
                }
            }
        }
        nextStepRecommendationsRaw.slice(0, 2).forEach(rec => {
            if (finalRecommendations.length < 10 && !recommendedCourseIds.has(rec.courseId.toString())) {
                finalRecommendations.push(rec);
                recommendedCourseIds.add(rec.courseId.toString());
            }
        });
    }

    // --- 3. "Interest-Based" Recommendations ---
    if (userInterests.length > 0 && finalRecommendations.length < 10) {
        const potentialInterestCourses = await Course.find({
            category: { $in: userInterests },
            _id: { $nin: Array.from(recommendedCourseIds) }
        }).select('_id title category description tags createdAt difficulty'); // description is already selected

        const interestBasedRecommendations = potentialInterestCourses
            .filter(course => {
                const status = courseCompletionStatus.get(course._id.toString());
                return status && !status.isFullyCompleted;
            })
            .map(course => ({
                type: 'interest_based',
                courseId: course._id,
                courseTitle: course.title,
                description: course.description, // <-- ADD description
                category: course.category,
                tags: course.tags || [],
                difficulty: course.difficulty,
                message: `Based on your interest in "${course.category}": "${course.title}"`,
                link: `/courses/${course._id}`
            }));
        
        interestBasedRecommendations.slice(0, 3).forEach(rec => {
             if (finalRecommendations.length < 10 && !recommendedCourseIds.has(rec.courseId.toString())) {
                finalRecommendations.push(rec);
                recommendedCourseIds.add(rec.courseId.toString());
            }
        });
    }

    // --- 4. "Category-Based" Recommendations ---
    if (finalRecommendations.length < 10 && completedLessonIdsSet.size > 0) {
        const engagedCourseDetails = allCourses.filter(c => {
            const status = courseCompletionStatus.get(c._id.toString());
            return status && status.completedLessons > 0;
        });
        const engagedCategories = [...new Set(engagedCourseDetails.map(course => course.category).filter(Boolean))];

        if (engagedCategories.length > 0) {
            const potentialCategoryCourses = await Course.find({
                category: { $in: engagedCategories },
                _id: { $nin: Array.from(recommendedCourseIds) }
            }).select('_id title category description tags createdAt difficulty'); // description is already selected

            const categoryBasedRecommendations = potentialCategoryCourses
                .filter(course => {
                    const status = courseCompletionStatus.get(course._id.toString());
                    return status && !status.isFullyCompleted;
                })
                .map(course => ({
                    type: 'category_based',
                    courseId: course._id,
                    courseTitle: course.title,
                    description: course.description, // <-- ADD description
                    category: course.category,
                    tags: course.tags || [],
                    difficulty: course.difficulty,
                    message: `More in "${course.category}": "${course.title}"`,
                    link: `/courses/${course._id}`
                }));

            categoryBasedRecommendations.slice(0, 3).forEach(rec => {
                if (finalRecommendations.length < 10 && !recommendedCourseIds.has(rec.courseId.toString())) {
                    finalRecommendations.push(rec);
                    recommendedCourseIds.add(rec.courseId.toString());
                }
            });
        }
    }

    // --- 5. Fallback Recommendations ---
    if (finalRecommendations.length === 0) {
        const fallbackCourses = allCourses
            .filter(course => {
                const status = courseCompletionStatus.get(course._id.toString());
                return (!status || !status.isFullyCompleted) && !recommendedCourseIds.has(course._id.toString());
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3)
            .map(course => ({
                type: 'fallback_recent',
                courseId: course._id,
                courseTitle: course.title,
                description: course.description, // <-- ADD description
                category: course.category,
                tags: course.tags || [],
                difficulty: course.difficulty,
                message: `Recently Added: "${course.title}"`,
                link: `/courses/${course._id}`
            }));
        
        fallbackCourses.forEach(rec => {
            if (finalRecommendations.length < 10 && !recommendedCourseIds.has(rec.courseId.toString())) {
               finalRecommendations.push(rec);
               recommendedCourseIds.add(rec.courseId.toString());
           }
       });
    }
    
    finalRecommendations = finalRecommendations.slice(0, 10);
    res.status(200).json(finalRecommendations);
});

module.exports = {
  getRecommendations,
};
