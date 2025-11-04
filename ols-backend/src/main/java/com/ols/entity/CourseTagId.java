package com.ols.entity;

import com.ols.common.Tag;

import java.io.Serializable;
import java.util.Objects;

public class CourseTagId implements Serializable {

    private Course course;
    private Tag tag;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CourseTagId that = (CourseTagId) o;
        return Objects.equals(course, that.course) && tag == that.tag;
    }

    @Override
    public int hashCode() {
        return Objects.hash(course, tag);
    }

}
