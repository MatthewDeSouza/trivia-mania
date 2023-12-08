#!/usr/bin/env python3

import random
import json

# JSON data
json_data = []

# Generating an array of size 34 with random values between 0 and 3, ensuring no back-to-back duplicates
array_size = 34
random_array = [random.randint(0, 3)]
for _ in range(1, array_size):
    while True:
        new_number = random.randint(0, 3)
        if new_number != random_array[-1]:
            random_array.append(new_number)
            break

# Function to shuffle options
def shuffle_options(options, correct_index, new_index):
    if correct_index != new_index:
        options[correct_index], options[new_index] = options[new_index], options[correct_index]
    return options

# Iterate through each question and shuffle options
question_index = 0
for category in json_data:
    for question in category["questions"]:
        correct_index = ord(question["correct"]) - ord('a')
        new_index = random_array[question_index]
        question["options"] = shuffle_options(question["options"], correct_index, new_index)
        question["correct"] = chr(ord('a') + new_index)
        question_index += 1

# Output the modified JSON
print(json.dumps(json_data, indent=4))
