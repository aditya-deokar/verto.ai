import { Skeleton } from "@/components/ui/skeleton"

const PresentationSkeleton = () => {
  return (
    <div className='h-screen bg-secondary/10 p-1.5 sm:p-2 overflow-hidden flex flex-col gap-1.5 sm:gap-2 relative'>
      {/* Navbar Skeleton */}
      <div className='h-12 sm:h-14 rounded-xl bg-background/80 backdrop-blur-md shadow-sm border mx-auto w-full z-50 flex items-center px-4 justify-between'>
        <div className="flex items-center gap-4">
           <Skeleton className="h-8 w-8 rounded-lg" />
           <Skeleton className="h-6 w-40 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
           <Skeleton className="h-9 w-24 rounded-lg" />
           <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>

      <div className='flex-1 flex gap-1.5 sm:gap-2 min-h-0 w-full mx-auto z-0'>
        {/* Left Sidebar Skeleton */}
        <div className='hidden lg:block lg:w-72 xl:w-80 h-full rounded-xl bg-background/80 backdrop-blur-md shadow-sm border p-4 space-y-4'>
           <div className="flex items-center justify-between mb-2">
             <Skeleton className="h-6 w-1/2 rounded-md" />
             <Skeleton className="h-8 w-8 rounded-full" />
           </div>
           <div className="space-y-4">
             {[1, 2, 3, 4].map((i) => (
               <div key={i} className="space-y-2">
                 <Skeleton className="h-24 w-full rounded-lg" />
                 <Skeleton className="h-3 w-1/2 mx-auto rounded-full" />
               </div>
             ))}
           </div>
        </div>

        {/* Main Canvas Skeleton */}
        <div className='flex-1 h-full rounded-xl bg-muted/30 border relative shadow-inner p-4 sm:p-8 flex flex-col items-center justify-center space-y-6'>
           <div className="w-full h-full bg-background/50 rounded-2xl shadow-lg flex flex-col items-center justify-center p-12 space-y-8">
             <Skeleton className="h-12 w-2/3 rounded-xl" />
             <div className="w-full space-y-4">
               <Skeleton className="h-4 w-full rounded-full" />
               <Skeleton className="h-4 w-5/6 rounded-full" />
               <Skeleton className="h-4 w-4/6 rounded-full" />
             </div>
             <div className="grid grid-cols-2 gap-6 w-full pt-8">
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
             </div>
           </div>
        </div>

        {/* Right Sidebar Skeleton */}
        <div className='hidden xl:block xl:w-80 h-full rounded-xl bg-background/80 backdrop-blur-md shadow-sm border p-4 space-y-8'>
           <div className="space-y-4">
             <Skeleton className="h-6 w-1/3 rounded-md" />
             <div className="grid grid-cols-2 gap-3">
               {[1, 2, 3, 4].map((i) => (
                 <Skeleton key={i} className="h-20 w-full rounded-lg" />
               ))}
             </div>
           </div>
           
           <div className="space-y-4">
             <Skeleton className="h-6 w-1/2 rounded-md" />
             <div className="space-y-3">
               <Skeleton className="h-10 w-full rounded-lg" />
               <Skeleton className="h-10 w-full rounded-lg" />
               <Skeleton className="h-10 w-full rounded-lg" />
             </div>
           </div>

           <div className="space-y-4">
             <Skeleton className="h-6 w-2/3 rounded-md" />
             <div className="flex gap-2">
               <Skeleton className="h-8 w-8 rounded-full" />
               <Skeleton className="h-8 w-8 rounded-full" />
               <Skeleton className="h-8 w-8 rounded-full" />
               <Skeleton className="h-8 w-8 rounded-full" />
             </div>
           </div>
        </div>
      </div>
    </div>
  )
}

export default PresentationSkeleton;
