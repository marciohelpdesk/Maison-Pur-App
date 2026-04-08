import { useNavigate, useParams } from 'react-router-dom';
import { JobDetailsView as JobDetailsContent } from '@/views/JobDetailsView';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';
import { useProperties } from '@/hooks/useProperties';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useRole } from '@/hooks/useRole';
import { Job, JobStatus } from '@/types';
import { PageLoader } from '@/lib/routes';

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobs, updateJob, deleteJob, isLoading: jobsLoading } = useJobs(user?.id);
  const { properties, isLoading: propertiesLoading } = useProperties(user?.id);
  const { members: teamMembers, isLoading: teamLoading } = useTeamMembers(user?.id);
  const { isCleaner } = useRole(user?.id);

  const isLoading = jobsLoading || propertiesLoading || teamLoading;
  const job = jobs.find(j => j.id === id);

  const handleBack = () => {
    if (isCleaner) {
      navigate('/dashboard');
    } else {
      navigate('/agenda');
    }
  };

  const handleStartJob = (jobId: string) => {
    const targetJob = jobs.find(j => j.id === jobId);
    if (targetJob) {
      if (targetJob.status === JobStatus.IN_PROGRESS) {
        navigate(`/execution/${jobId}`);
      } else {
        updateJob({
          ...targetJob,
          status: JobStatus.IN_PROGRESS,
          startTime: Date.now(),
          currentStep: 'BEFORE_PHOTOS'
        });
        navigate(`/execution/${jobId}`);
      }
    }
  };

  const handleUpdateJob = (updatedJob: Job) => {
    updateJob(updatedJob);
  };

  const handleEditCompletedJob = (jobId: string) => {
    const targetJob = jobs.find(j => j.id === jobId);
    if (targetJob) {
      updateJob({
        ...targetJob,
        status: JobStatus.IN_PROGRESS,
        currentStep: 'CHECKLIST',
      });
      navigate(`/execution/${jobId}`);
    }
  };

  const handleDeleteJob = (jobId: string) => {
    deleteJob(jobId);
    navigate('/agenda');
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (!job) {
    navigate(isCleaner ? '/dashboard' : '/agenda');
    return null;
  }

  return (
    <JobDetailsContent
      job={job}
      properties={properties}
      teamMembers={teamMembers}
      isCleaner={isCleaner}
      onBack={handleBack}
      onStartJob={handleStartJob}
      onUpdateJob={handleUpdateJob}
      onDeleteJob={handleDeleteJob}
      onEditCompletedJob={handleEditCompletedJob}
    />
  );
}
