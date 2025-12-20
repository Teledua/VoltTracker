import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jvpodzmesnmlqejokjnq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2cG9kem1lc25tbHFlam9ram5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyMDkxNjcsImV4cCI6MjA4MTc4NTE2N30.bboqeNL_0ZVkcXTIm6gmoUJgvqlnOqnhjhnqQ7AuAv4'

export const supabase = createClient(supabaseUrl, supabaseKey)