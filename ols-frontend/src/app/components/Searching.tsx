'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../lib/axiosInstance';
import { Tag } from '../../types/tag'; 

function SearchingComponent() {
    const [tagList, setTagList] = useState<Array<Tag>>([]);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [selectedTags, setSelectedTags] = useState<Set<Tag>>(new Set());
    const wrapperRef = useRef<HTMLDivElement>(null); // ✅ 외부 클릭 감지를 위한 ref
    const router = useRouter();

    // ✅ 외부 클릭 감지를 위한 useEffect 훅
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [wrapperRef]);

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const res = await axiosInstance.get('/courses/tags');
            const tagDto: Array<Tag> = res.data;

            // const tmp: Array<string> = [];
            // tagDto.forEach(tag => {
            //     tmp.push(tag.displayName);
            // });

            setTagList(tagDto);
        } catch(err: any) {
            console.log(err);
        }
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const searchParams = new URLSearchParams();

        if (!selectedTags || selectedTags.size === 0) {
            alert('태그를 선택해주세요');
            return;
        }

        selectedTags.forEach(tag => {
            searchParams.append('q', tag.name);
        });

        setIsExpanded(false);
        setSelectedTags(new Set());
        router.push(`/search?${searchParams.toString()}`);
    };

    const handleTagClick = (tag: Tag) => {
        setSelectedTags((prev) => {
            const newSet = new Set(prev);
            if (prev.has(tag)) {
                newSet.delete(tag);
            }
            else {
                newSet.add(tag);
            }
            return newSet;
        })
    };

    return (
        <div className="searching-component-container" ref={wrapperRef}>
            <form onSubmit={handleSearch} className="search-form">
                <div 
                    className="search-box" 
                    onClick={() => setIsExpanded(prev => !prev)}
                >
                    {/* ✅ SVG 아이콘을 input 태그 앞으로 이동 */}
                    <svg className="search-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    <div className="selected-tags-container">
                        {Array.from(selectedTags).map(tag => (
                            <span key={tag.name} className="selected-tag-chip">
                                {tag.displayName}
                                <span onClick={(e) => { e.stopPropagation(); handleTagClick(tag); }} className="remove-tag">×</span>
                            </span>
                        ))}
                        <input
                            type="text"
                            className="search-input"
                            placeholder={selectedTags.size === 0 ? "태그로 검색..." : ""}
                            readOnly
                        />
                    </div>
                </div>
                
                {/* ✅ tag-expansion-area를 form 바로 아래에 위치 */}
                {isExpanded && (
                    <div className="tag-expansion-area">
                        <div className="tag-list">
                            {tagList.map(tag => (
                                <span
                                    key={tag.displayName}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleTagClick(tag);
                                    }}
                                    className={`tag-item ${selectedTags.has(tag) ? 'selected' : ''}`}
                                >
                                    {tag.displayName}
                                </span>
                            ))}
                        </div>
                        <button type="submit" className="search-button">검색</button>
                    </div>
                )}
            </form>
        </div>
    );
}

export default SearchingComponent;